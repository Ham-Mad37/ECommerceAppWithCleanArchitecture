using MediatR;

namespace ECommerce.Application.Features.Customers.Commands.UpdateCustomer
{
   public sealed record UpdateCustomerCommand(
    int Id,
    string FirstName,
    string LastName) : IRequest;
}