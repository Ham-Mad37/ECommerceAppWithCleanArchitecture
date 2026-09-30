using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Customers.Commands.DeactivateCustomer;
public sealed class DeactivateCustomerCommandHandler : IRequestHandler<DeactivateCustomerCommand>
{
    private readonly ICustomerRepository _customerRepository;
    private readonly IUnitOfWork _unitOfWork;
    public DeactivateCustomerCommandHandler(ICustomerRepository customerRepository, IUnitOfWork unitOfWork)
    {
        _customerRepository = customerRepository;
        _unitOfWork = unitOfWork;
    }
    public async Task Handle(DeactivateCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = await _customerRepository.GetByIdAsync(request.Id, cancellationToken);
        if (customer is null)
        {
            throw new NotFoundException($"Customer with Id {request.Id} was not found.");
        }
        customer.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}