using MediatR;

namespace ECommerce.Application.Features.Orders.Commands.ConfirmOrder;

public sealed record ConfirmOrderCommand(int OrderId) : IRequest;