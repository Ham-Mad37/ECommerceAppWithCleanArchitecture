using System.Security.Cryptography.X509Certificates;
using ECommerce.Domain.Entities.Cart;
using ECommerce.Domain.Entities.Customers;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Configurations
{
    public class CartConfiguration : IEntityTypeConfiguration<Cart>
    {
        public void Configure(EntityTypeBuilder<Cart> builder)
        {
            builder.ToTable("Carts");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.CustomerId)
            .IsRequired();

            builder.Property(x => x.CreatedAt)
            .IsRequired();

            builder.Property(x => x.UpdatedAt)
            .IsRequired();

            builder.HasIndex(x => x.CustomerId)
            .IsUnique();

            builder.HasOne<Customer>()
            .WithOne()
            .HasForeignKey<Cart>(x => x.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(x => x.Items)
            .WithOne()
            .OnDelete(DeleteBehavior.Cascade);
            
        }
    }
}