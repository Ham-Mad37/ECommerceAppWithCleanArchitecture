using MediatR;

namespace ECommerce.Application.Features.Orders.Commands.StartProcessingOrder;

public sealed record StartProcessingOrderCommand(int OrderId) : IRequest;