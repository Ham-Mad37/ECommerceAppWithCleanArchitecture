using ECommerce.Domain.Entities.Categories;
using ECommerce.Domain.Entities.Products;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Data;

public static class CatalogSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Only skip when products already exist. Categories are checked separately below,
        // so a half-finished earlier run gets completed instead of skipped.
        if (await context.Products.AnyAsync())
            return;

        var wanted = new[] { "Electronics", "Clothing", "Home & Kitchen", "Books", "Sports" };

        var existing = await context.Categories.ToListAsync();
        foreach (var name in wanted)
        {
            if (existing.All(c => c.Name != name))
                context.Categories.Add(Category.Create(name));
        }
        await context.SaveChangesAsync();

        var cat = (await context.Categories.ToListAsync()).ToDictionary(c => c.Name, c => c.Id);

        var products = new List<Product>
        {
            Product.Create("Wireless Headphones", "Bluetooth over-ear headphones with 30-hour battery.", 89.99m, 40, cat["Electronics"]),
            Product.Create("Smart Watch", "Fitness tracking, heart-rate monitor and notifications.", 149.00m, 25, cat["Electronics"]),
            Product.Create("USB-C Fast Charger", "65W charger for laptops and phones.", 29.50m, 120, cat["Electronics"]),
            Product.Create("Mechanical Keyboard", "Compact keyboard with tactile switches.", 74.90m, 35, cat["Electronics"]),
            Product.Create("Portable Speaker", "Waterproof speaker with deep bass.", 45.00m, 60, cat["Electronics"]),

            Product.Create("Cotton T-Shirt", "Soft 100% cotton, regular fit.", 14.99m, 200, cat["Clothing"]),
            Product.Create("Denim Jacket", "Classic denim jacket, all seasons.", 59.90m, 45, cat["Clothing"]),
            Product.Create("Running Shoes", "Lightweight shoes with cushioned sole.", 79.00m, 70, cat["Clothing"]),
            Product.Create("Wool Scarf", "Warm scarf for winter.", 19.50m, 90, cat["Clothing"]),

            Product.Create("Non-stick Frying Pan", "28 cm pan, induction compatible.", 24.99m, 80, cat["Home & Kitchen"]),
            Product.Create("Electric Kettle", "1.7 L stainless steel kettle.", 32.00m, 55, cat["Home & Kitchen"]),
            Product.Create("Chef Knife Set", "Five-piece stainless steel knife set.", 54.90m, 30, cat["Home & Kitchen"]),
            Product.Create("Coffee Maker", "Drip coffee maker, 12 cups.", 64.00m, 3, cat["Home & Kitchen"]),

            Product.Create("Clean Architecture Guide", "Practical guide to layered .NET applications.", 34.99m, 100, cat["Books"]),
            Product.Create("C# in Depth", "Deep dive into the C# language.", 39.99m, 75, cat["Books"]),
            Product.Create("The Pragmatic Programmer", "Classic book on software craftsmanship.", 42.00m, 0, cat["Books"]),

            Product.Create("Yoga Mat", "6 mm non-slip mat.", 18.99m, 110, cat["Sports"]),
            Product.Create("Adjustable Dumbbells", "Pair, 2-20 kg adjustable.", 119.00m, 15, cat["Sports"]),
            Product.Create("Football", "Size 5 match ball.", 22.00m, 85, cat["Sports"]),
            Product.Create("Water Bottle", "1 L insulated bottle.", 16.50m, 150, cat["Sports"]),
        };

        context.Products.AddRange(products);
        await context.SaveChangesAsync();
    }
}