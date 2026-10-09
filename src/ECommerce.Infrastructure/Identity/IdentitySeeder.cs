using ECommerce.Application.Common.Constants;
using Microsoft.AspNetCore.Identity;

namespace ECommerce.Infrastructure.Identity;

public static class IdentitySeeder
{
    public static async Task SeedAsync(
        RoleManager<IdentityRole> roleManager,
        UserManager<ApplicationUser> userManager)
    {
        var roles = new[]
        {
            Roles.Customer,
            Roles.Admin
        };

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                var result = await roleManager.CreateAsync(
                    new IdentityRole(role));

                if (!result.Succeeded)
                {
                    var errors = string.Join(
                        ", ",
                        result.Errors.Select(x => x.Description));

                    throw new InvalidOperationException(
                        $"Failed to create role '{role}': {errors}");
                }
            }
        }

        const string adminEmail = "admin@ecommerce.com";
        const string adminPassword = "Admin@12345";

        var adminUser =
            await userManager.FindByEmailAsync(adminEmail);

        if (adminUser is null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true
            };

            var createResult =
                await userManager.CreateAsync(
                    adminUser,
                    adminPassword);

            if (!createResult.Succeeded)
            {
                var errors = string.Join(
                    ", ",
                    createResult.Errors.Select(x => x.Description));

                throw new InvalidOperationException(
                    $"Failed to create admin user: {errors}");
            }
        }

        if (!await userManager.IsInRoleAsync(
                adminUser,
                Roles.Admin))
        {
            var roleResult =
                await userManager.AddToRoleAsync(
                    adminUser,
                    Roles.Admin);

            if (!roleResult.Succeeded)
            {
                var errors = string.Join(
                    ", ",
                    roleResult.Errors.Select(x => x.Description));

                throw new InvalidOperationException(
                    $"Failed to assign Admin role: {errors}");
            }
        }
    }
}