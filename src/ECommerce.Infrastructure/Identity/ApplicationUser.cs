using ECommerce.Domain.Entities.Customers;
using Microsoft.AspNetCore.Identity;

public sealed class ApplicationUser : IdentityUser
{
    public int? CustomerId { get; set; }
    public Customer? Customer { get; set; }
}