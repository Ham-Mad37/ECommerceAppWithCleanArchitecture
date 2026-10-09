using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using FluentValidation.Validators;
using MediatR;
using Microsoft.IdentityModel.Tokens;

namespace ECommerce.Application.Features.Orders.Commands.ConfirmOrder;

public sealed class ConfirmOrderCommandHandler : IRequestHandler<ConfirmOrderCommand>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ConfirmOrderCommandHandler(IOrderRepository orderRepository,IUnitOfWork unitOfWork)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
    }
    public async Task Handle(ConfirmOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdForAdminAsync(request.OrderId,cancellationToken);

        if (order is null)
            throw new NotFoundException($"Order with ID {request.OrderId} was not found");

        order.Confirm();

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}