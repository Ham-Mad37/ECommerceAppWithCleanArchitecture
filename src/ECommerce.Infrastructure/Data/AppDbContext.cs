using Microsoft.EntityFrameworkCore;
using ECommerce.Domain.Entities.Products;
using ECommerce.Domain.Entities.Categories;
using ECommerce.Domain.Entities.Cart;
using ECommerce.Domain.Entities.Customers;
using ECommerce.Domain.Entities.Orders;
using ECommerce.Application.Common.Interfaces;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using ECommerce.Domain.Entities.Addresses;
using ECommerce.Domain.Entities.Payments;
using ECommerce.Application.Common.Exceptions;
using ECommerce.Infrastructure.Identity;
namespace ECommerce.Infrastructure.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>, IUnitOfWork
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
        public DbSet<Address> Addresses => Set<Address>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

        public async Task ExecuteInTransactionAsync(Func<Task> action, CancellationToken cancellationToken = default)
        {
            await using var transaction =
            await Database.BeginTransactionAsync(cancellationToken);

            try
            {
                await action();

                await transaction.CommitAsync(cancellationToken);
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }

        //
        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken=default)
        {
            try
            {
                return await base.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new ConflictException(
                    "The data was changed by another request while processing yours. " +
                    "Please review your cart or order and try again.");
            }
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        }
        
    }
}
