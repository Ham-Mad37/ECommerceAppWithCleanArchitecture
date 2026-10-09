using ECommerce.Domain.Entities.Orders;
using FluentValidation;

namespace ECommerce.Application.Features.Orders.Admin.GetAllOrders;

public sealed class GetAllOrdersQueryValidator
    : AbstractValidator<GetAllOrdersQuery>
{
    public GetAllOrdersQueryValidator()
    {
        RuleFor(x => x.Page)
           .GreaterThan(0);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100);

        RuleFor(x => x.CustomerId)
           .GreaterThan(0)
           .When(x => x.CustomerId.HasValue);

        RuleFor(x => x.Status)
           .Must(BeValidStatus)
           .When(x => !string.IsNullOrWhiteSpace(x.Status))
           .WithMessage("The specified order status is invalid.");

        RuleFor(x => x.From)
            .LessThanOrEqualTo(x => x.To)
            .When(x => x.From.HasValue && x.To.HasValue)
            .WithMessage("From date must be earlier than or equal to To date.");
    }
    private static bool BeValidStatus(string? status)
    {
        return Enum.TryParse<OrderStatus>(
                   status,
                   ignoreCase: true,
                   out var parsedStatus)
               && Enum.IsDefined(parsedStatus);
    }
}