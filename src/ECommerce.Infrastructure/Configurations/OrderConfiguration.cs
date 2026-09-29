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

            builder.HasIndex(x => x.CustomerId);

            builder.HasIndex(x => x.Status);

            builder.HasIndex(x => x.CreatedAt);

            builder.HasOne<Customer>()
            .WithMany()
            .HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(x => x.Items)
            .WithOne()
            .HasForeignKey(x => x.OrderId)
            .OnDelete(DeleteBehavior.Restrict);
            

        }
    }
}