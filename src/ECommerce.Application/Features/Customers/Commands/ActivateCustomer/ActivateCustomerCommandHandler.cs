using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Customers.Commands.ActivateCustomer
{
    public class ActivateCustomerCommandHandler : IRequestHandler<ActivateCustomerCommand>
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly IUnitOfWork _unitOfWork;
        public ActivateCustomerCommandHandler(ICustomerRepository customerRepository, IUnitOfWork unitOfWork)
        {
            _customerRepository = customerRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task Handle(ActivateCustomerCommand request, CancellationToken cancellationToken)
        {
           var customer = await _customerRepository.GetByIdAsync(request.Id,cancellationToken);
            if (customer is null)
            {
                throw new NotFoundException($"Customer with Id {request.Id} was not found.");
            }
            customer.Activate();
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}