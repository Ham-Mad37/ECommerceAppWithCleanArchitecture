using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Customers.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Customers.Queries.GetCustomers
{
    public sealed class GetCustomersQueryHandler : IRequestHandler<GetCustomersQuery, IReadOnlyCollection<CustomerListDto>>
    {
        private readonly ICustomerRepository _customerRepository;
        public GetCustomersQueryHandler(
         ICustomerRepository customerRepository)
        {
            _customerRepository = customerRepository;
        }

        public async Task<IReadOnlyCollection<CustomerListDto>> Handle(GetCustomersQuery request, CancellationToken cancellationToken)
        {
            var customers = await _customerRepository.GetAllAsync(cancellationToken);

            return customers
            .Select(customer => new CustomerListDto(
                customer.Id,
                customer.FirstName,
                customer.LastName,
                customer.Email,
                customer.IsActive
            )).ToList();
        }
    }
}