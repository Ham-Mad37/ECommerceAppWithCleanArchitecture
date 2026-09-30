using MediatR;
namespace ECommerce.Application.Features.Customers.Commands.DeactivateCustomer;
public sealed record DeactivateCustomerCommand(int Id) : IRequest;