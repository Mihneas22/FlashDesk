using Domain.Models;
using Domain.Models.Graphs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;

namespace Infastructure.AppDbContext
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            :base(options)
        {
           
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasMany(us => us.UserDecks)
                .WithOne(fc => fc.DeckUser)
                .HasForeignKey(fc => fc.DeckUserId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<User>()
                .HasMany(us => us.UserSubmissions)
                .WithOne(sub => sub.Subm_User)
                .HasForeignKey(sub => sub.Subm_UserId)
                .OnDelete(DeleteBehavior.Cascade);


            modelBuilder.Entity<Deck>()
                .HasMany(dc => dc.DeckCards)
                .WithOne(card => card.CardDeck)
                .HasForeignKey(card => card.DeckId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Test>()
                .HasMany(ts => ts.Questions)
                .WithOne(qs => qs.Quest_Test)
                .HasForeignKey(qs => qs.Quest_TestId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Test>()
                .HasMany(ts => ts.Submissions)
                .WithOne(qs => qs.Subm_Test)
                .HasForeignKey(qs => qs.Subm_TestId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Streak)
                .WithOne(s => s.User)
                .HasForeignKey<Streak>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Card>(entity =>
            {
                entity.Property(e => e.ViewConfig)
                    .HasColumnType("jsonb")
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                        v => JsonSerializer.Deserialize<ViewConfig>(v, (JsonSerializerOptions)null)
                    );
            });
        }

        public DbSet<User> UserEntity { get; set; }
        public DbSet<Deck> DeckEntity { get; set; }
        public DbSet<Card> CardEntity { get; set; }

        public DbSet<Streak> StreakEntity { get; set; }

        public DbSet<Test> TestEntity { get; set; }
        public DbSet<TestQuestion> TestQuestionEntity { get; set; }
        public DbSet<TestSubmission> TestSubmissionEntity { get; set; }
    }
}
