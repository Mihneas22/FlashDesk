using Domain.Models;
using Domain.Models.Graphs;
using Domain.Models.UserStats;
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
                .HasMany(us => us.UserCardReviews)
                .WithOne(ucr => ucr.User)
                .HasForeignKey(ucr => ucr.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .HasMany(us => us.UserDailyStats)
                .WithOne(ucs => ucs.User)
                .HasForeignKey(ucs => ucs.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .HasMany(us => us.UserSubmissions)
                .WithOne(sub => sub.Subm_User)
                .HasForeignKey(sub => sub.Subm_UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .HasMany(us => us.UserCardStates)
                .WithOne(ucs => ucs.User)
                .HasForeignKey(ucs => ucs.UserId)
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

            modelBuilder.Entity<Card>()
                .HasMany(cd => cd.CardReviews)
                .WithOne(cr => cr.Card)
                .HasForeignKey(cr => cr.CardId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Card>()
                .HasMany(cd => cd.UserCardStates)
                .WithOne(ucs => ucs.Card)
                .HasForeignKey(cr => cr.CardId)
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

            modelBuilder.Entity<Card>(entity =>
            {
                entity.Property(e => e.MatrixConfig)
                    .HasColumnType("jsonb")
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                        v => JsonSerializer.Deserialize<MatrixViewConfig>(v, (JsonSerializerOptions)null)
                    );
            });
        }

        public DbSet<User> UserEntity { get; set; }
        public DbSet<Deck> DeckEntity { get; set; }
        public DbSet<Card> CardEntity { get; set; }

        public DbSet<CardReview> CardReviewEntity { get; set; }
        public DbSet<DailyStats> DailyStatsEntity { get; set; }
        public DbSet<UserCardState> UserCardStateEntity { get; set; }
        public DbSet<Streak> StreakEntity { get; set; }


        public DbSet<Test> TestEntity { get; set; }
        public DbSet<TestQuestion> TestQuestionEntity { get; set; }
        public DbSet<TestSubmission> TestSubmissionEntity { get; set; }
    }
}
