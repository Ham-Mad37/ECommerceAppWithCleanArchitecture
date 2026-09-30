using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Customers.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Customers.Queries.GetCustomerById;

public sealed class GetCustomerByIdQueryHandler : IRequestHandler<GetCustomerByIdQuery, CustomerDto?>
{
    private readonly ICustomerRepository _customerRepository;
    public GetCustomerByIdQueryHandler(ICustomerRepository customerRepository)
    {
        _customerRepository = customerRepository;
    }
    public async Task<CustomerDto?> Handle(GetCustomerByIdQuery request, CancellationToken cancellationToken)
    {
        var customer = await _customerRepository.GetByIdAsync(request.id, cancellationToken);
        if (customer is null)
            return null;
        return new CustomerDto(
            customer.Id,
            customer.FirstName,
            customer.LastName,
            customer.Email,
            customer.IsActive,
            customer.CreatedAt,
            customer.UpdatedAt
        );
    }
}