using MediatR;
namespace ECommerce.Application.Features.Customers.Commands.ActivateCustomer
{
    public sealed record ActivateCustomerCommand(
     int Id) : IRequest;
}