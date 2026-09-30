using ECommerce.Application.Features.Customers.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Customers.Queries.GetCustomerById;

public sealed record GetCustomerByIdQuery(int id) : IRequest<CustomerDto?>;