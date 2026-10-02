using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ECommerce.Infrastructure.Identity;
namespace ECommerce.Infrastructure.Identity.Configurations;

public sealed class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.HasOne(u => u.Customer)
            .WithOne()
            .HasForeignKey<ApplicationUser>(u => u.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.CustomerId)
           .IsUnique()
           .HasFilter("[CustomerId] IS NOT NULL");
    }
}
