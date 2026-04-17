using Domain.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

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

            modelBuilder.Entity<Deck>()
                .HasMany(dc => dc.DeckCards)
                .WithOne(card => card.CardDeck)
                .HasForeignKey(card => card.DeckId);
        }

        public DbSet<User> UserEntity { get; set; }
        public DbSet<Deck> DeckEntity { get; set; }
        public DbSet<Card> CardEntity { get; set; }
    }
}
