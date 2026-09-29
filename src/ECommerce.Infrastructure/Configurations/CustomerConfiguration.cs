using ECommerce.Domain.Entities.Customers;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Configurations
{
    public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
    {
        public void Configure(EntityTypeBuilder<Customer> builder)
        {
            builder.ToTable("Customers");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.FirstName)
            .IsRequired()
            .HasMaxLength(100);

            builder.Property(x => x.LastName)
            .IsRequired()
            .HasMaxLength(100);

            builder.Property(x => x.Email)
            .IsRequired()
            .HasMaxLength(255);

            builder.Property(x => x.IsActive)
           .IsRequired();

            builder.Property(x => x.CreatedAt)
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .IsRequired();

            builder.HasIndex(x => x.Email);
            
        }
    }
}