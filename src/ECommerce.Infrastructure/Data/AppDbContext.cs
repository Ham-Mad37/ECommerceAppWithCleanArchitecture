using Microsoft.EntityFrameworkCore;
using ECommerce.Domain.Entities.Products;
using ECommerce.Domain.Entities.Categories;
using ECommerce.Domain.Entities.Cart;
using ECommerce.Domain.Entities.Customers;
using ECommerce.Domain.Entities.Orders;
using ECommerce.Application.Common.Interfaces;
namespace ECommerce.Infrastructure.Data
{
    public class AppDbContext : DbContext,IUnitOfWork
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
            
        }
        public DbSet<Product> Products => Set<Product>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Customer> Customers => Set<Customer>();
        public DbSet<Cart> Carts => Set<Cart>();
        public DbSet<CartItem> CartItems => Set<CartItem>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        //
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        }
        
    }
}
