using ECommerce.Domain.Entities.Customers;
using ECommerce.Domain.Entities.Orders;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Configurations
{
    public class OrderConfiguration : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            builder.ToTable("Orders");

            builder.HasIndex(x => x.Id);

            builder.Property(x => x.Status)
            .IsRequired();

            builder.Property(x => x.SubTotal)
            .HasPrecision(18, 2);

            builder.Property(x => x.Discount)
            .HasPrecision(18, 2);

            builder.Property(x => x.ShippingCost)
            .HasPrecision(18, 2);

            builder.Property(x => x.Total)
            .HasPrecision(18, 2);

            builder.Property(x => x.CreatedAt)
            .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .IsRequired();
            builder.Property(x => x.RowVersion).IsRowVersion();
            builder.HasIndex(x => x.CustomerId);

            builder.HasIndex(x => x.Status);

            builder.HasIndex(x => x.CreatedAt);

            builder.HasOne(x=>x.Customer)
            .WithMany()
            .HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(x => x.Items)
            .WithOne()
            .HasForeignKey(x => x.OrderId)
            .OnDelete(DeleteBehavior.Restrict);

            builder.OwnsOne(x => x.ShippingAddress, a =>
            {
                a.Property(p => p.RecipientName).HasColumnName("ShippingRecipientName").HasMaxLength(150).IsRequired();
                a.Property(p => p.Phone).HasColumnName("ShippingPhone").HasMaxLength(30).IsRequired();
                a.Property(p => p.Line1).HasColumnName("ShippingLine1").HasMaxLength(200).IsRequired();
                a.Property(p => p.Line2).HasColumnName("ShippingLine2").HasMaxLength(200);
                a.Property(p => p.City).HasColumnName("ShippingCity").HasMaxLength(100).IsRequired();
                a.Property(p => p.State).HasColumnName("ShippingState").HasMaxLength(100);
                a.Property(p => p.PostalCode).HasColumnName("ShippingPostalCode").HasMaxLength(20);
                a.Property(p => p.Country).HasColumnName("ShippingCountry").HasMaxLength(100).IsRequired();
            });
            

        }
    }
}