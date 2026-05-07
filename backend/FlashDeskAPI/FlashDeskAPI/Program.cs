using Infastructure.DepInject;
using Infastructure.AppDbContext;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.InfastructureService(builder.Configuration);

builder.Services.AddCors(options => {
    options.AddPolicy("AllowNextJS",
        policy => policy.WithOrigins("https://learnqhub.com", "https://www.learnqhub.com")
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try 
    {
        var db = services.GetRequiredService<ApplicationDbContext>();
        db.Database.Migrate();
        Console.WriteLine("Migrările au fost aplicate cu succes!");
    }
    catch (Exception ex) 
    {
        Console.WriteLine($"Eroare la migrare: {ex.Message}");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowNextJS");

//app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.UseRateLimiter();

app.MapControllers();

app.Run();
