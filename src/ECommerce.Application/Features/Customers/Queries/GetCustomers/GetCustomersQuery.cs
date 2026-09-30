using ECommerce.Application.Features.Customers.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Customers.Queries.GetCustomers
{
    public sealed record GetCustomersQuery : IRequest<IReadOnlyCollection<CustomerListDto>>;
}