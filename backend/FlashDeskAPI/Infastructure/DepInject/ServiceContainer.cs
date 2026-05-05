using Application.Repository;
using Infastructure.AppDbContext;
using Infastructure.Repository;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Stripe;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;

namespace Infastructure.DepInject
{
    public static class ServiceContainer
    {
        public static IServiceCollection InfastructureService(this IServiceCollection services, IConfiguration configuration)
        {
            string envPath = "";
            string currentDir = AppDomain.CurrentDomain.BaseDirectory;

            for (int i = 0; i < 5; i++)
            {
                string testPath = Path.Combine(currentDir, "keys.env");
                if (System.IO.File.Exists(testPath))
                {
                    envPath = testPath;
                    break;
                }
                currentDir = Directory.GetParent(currentDir)?.FullName ?? currentDir;
            }

            if (!string.IsNullOrEmpty(envPath))
            {
                DotNetEnv.Env.Load(envPath);
            }

            var stripeApiKey = Environment.GetEnvironmentVariable("STRIPE_API_KEY") 
                ?? throw new InvalidOperationException("STRIPE_API_KEY nu este configurată!");
            StripeConfiguration.ApiKey = stripeApiKey;
            string connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
                ?? throw new InvalidOperationException("DATABASE_URL nu este configurată!");
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseNpgsql(connectionString, b =>
                    b.MigrationsAssembly(typeof(ServiceContainer).Assembly.FullName));
            }, ServiceLifetime.Scoped);

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    ValidIssuer = configuration["Jwt:Issuer"],
                    ValidAudience = configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey
                        (Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!))
                };
            });

            services.AddAuthorization(options =>
            {
                options.AddPolicy("RequirePremium", policy =>
                    policy.RequireClaim("SubscriptionPlan", "Core", "Pro")
                );
            });

            services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

                options.AddPolicy("CreateDeckAI_Access", context =>
                {
                    var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "anonymous";
                    var userPlan = context.User.FindFirstValue("SubscriptionPlan") ?? "Free";

                    if (userPlan.Equals("Pro", StringComparison.OrdinalIgnoreCase))
                    {
                        return RateLimitPartition.GetNoLimiter(userId);
                    }

                    int permitLimit = userPlan.Equals("Core", StringComparison.OrdinalIgnoreCase) ? 5 : 1;

                    return RateLimitPartition.GetFixedWindowLimiter(userId, _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = permitLimit,
                        Window = TimeSpan.FromDays(1),
                        AutoReplenishment = true
                    });
                });
            });

            services.AddScoped<ICard, CardRepository>();
            services.AddScoped<IUser, UserRepository>();
            services.AddScoped<IDeck, DeckRepository>();
            services.AddScoped<ITest, TestRepository>();
            services.AddScoped<IQuestion, QuestionRepository>();
            services.AddHttpClient<IOcr, OcrRepository>(client => {
                client.Timeout = TimeSpan.FromSeconds(30);
            });

            return services;
        }
    }
}
