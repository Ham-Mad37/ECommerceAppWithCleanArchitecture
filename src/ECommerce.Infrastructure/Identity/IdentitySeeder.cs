using ECommerce.Application.Common.Constants;
using Microsoft.AspNetCore.Identity;

namespace ECommerce.Infrastructure.Identity;

public static class IdentitySeeder
{
    public static async Task SeedAsync(
        RoleManager<IdentityRole> roleManager)
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
    }
}