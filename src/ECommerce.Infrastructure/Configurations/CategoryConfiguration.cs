using ECommerce.Domain.Entities.Categories;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Configurations
{
    public class CategoryConfiruration : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            builder.ToTable("Categories");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(100);

            builder.Property(x => x.IsActive)
            .IsRequired();

            builder.Property(x => x.CreatedAt)
            .IsRequired();

            builder.Property(x => x.UpdatedAt)
            .IsRequired();

            builder.HasIndex(x => x.Name)
            .IsUnique();

            builder.HasData(
           new
           {
               Id = 1,
               Name = "Smartphones",
               IsActive = true,
               CreatedAt = new DateTime(2026, 1, 1),
               UpdatedAt = new DateTime(2026, 1, 1)
           },
           new
           {
               Id = 2,
               Name = "Laptops",
               IsActive = true,
               CreatedAt = new DateTime(2026, 1, 1),
               UpdatedAt = new DateTime(2026, 1, 1)
           },
           new
           {
               Id = 3,
               Name = "Tablets",
               IsActive = true,
               CreatedAt = new DateTime(2026, 1, 1),
               UpdatedAt = new DateTime(2026, 1, 1)
           },
           new
           {
               Id = 4,
               Name = "Headphones",
               IsActive = true,
               CreatedAt = new DateTime(2026, 1, 1),
               UpdatedAt = new DateTime(2026, 1, 1)
           },
           new
           {
               Id = 5,
               Name = "Monitors",
               IsActive = true,
               CreatedAt = new DateTime(2026, 1, 1),
               UpdatedAt = new DateTime(2026, 1, 1)
           },
           new
           {
               Id = 6,
               Name = "Keyboards",
               IsActive = true,
               CreatedAt = new DateTime(2026, 1, 1),
               UpdatedAt = new DateTime(2026, 1, 1)
           },
           new
           {
               Id = 7,
               Name = "Mice",
               IsActive = true,
               CreatedAt = new DateTime(2026, 1, 1),
               UpdatedAt = new DateTime(2026, 1, 1)
           },
           new
           {
               Id = 8,
               Name = "Cameras",
               IsActive = true,
               CreatedAt = new DateTime(2026, 1, 1),
               UpdatedAt = new DateTime(2026, 1, 1)
           },
           new
           {
               Id = 9,
               Name = "Gaming",
               IsActive = true,
               CreatedAt = new DateTime(2026, 1, 1),
               UpdatedAt = new DateTime(2026, 1, 1)
           },
           new
           {
               Id = 10,
               Name = "Accessories",
               IsActive = true,
               CreatedAt = new DateTime(2026, 1, 1),
               UpdatedAt = new DateTime(2026, 1, 1)
           }
       );
        }
    }
}