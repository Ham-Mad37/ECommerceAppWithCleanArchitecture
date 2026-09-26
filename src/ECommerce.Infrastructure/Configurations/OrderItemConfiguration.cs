using ECommerce.Domain.Entities.Orders;
using ECommerce.Domain.Entities.Products;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Configurations
{
    public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
    {
        public void Configure(EntityTypeBuilder<OrderItem> builder)
        {
            builder.ToTable("OrderItems");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.ProductName)
            .IsRequired()
            .HasMaxLength(100);

            builder.Property(x => x.UnitPrice)
            .HasPrecision(2, 18);

            builder.Property(x => x.Quantity)
            .IsRequired();

            builder.HasIndex(x => x.ProductId);

            builder.HasOne<Product>()
            .WithMany()
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

            builder.Ignore(x => x.LineTotl);
        }
    }
}