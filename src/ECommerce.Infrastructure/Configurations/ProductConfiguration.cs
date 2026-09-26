using ECommerce.Domain.Entities.Categories;
using ECommerce.Domain.Entities.Products;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Configurations
{
    public class ProductConfiguration : IEntityTypeConfiguration<Product>
    {
        public void Configure(EntityTypeBuilder<Product> builder)
        {
            builder.ToTable("Products");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(100);

            builder.Property(x => x.Description)
            .HasMaxLength(1000);

            builder.Property(x => x.Price)
            .HasPrecision(2, 18);

            builder.Property(x => x.StockQuantity)
           .IsRequired();

            builder.Property(x => x.IsActive)
                .IsRequired();

            builder.Property(x => x.CreatedAt)
                .IsRequired();
            
            builder.Property(x => x.UpdatedAt)
                .IsRequired();
            builder.HasIndex(x => x.CategoryId);

            builder.HasOne<Category>()
            .WithMany()
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
        }
    }
}