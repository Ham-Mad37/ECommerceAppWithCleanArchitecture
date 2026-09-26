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
        }
    }
}