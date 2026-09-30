using MediatR;

namespace ECommerce.Application.Features.Customers.Command.CreateCustomer;

public sealed record CreateCustomerCommand(
    string FirstName,
     string LastName,
      string Email
) : IRequest<int>;
