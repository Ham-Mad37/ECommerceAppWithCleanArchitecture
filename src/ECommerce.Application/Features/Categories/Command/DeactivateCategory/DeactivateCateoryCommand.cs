using MediatR;

namespace ECommerce.Application.Features.Categories.Command.DeactivateCategory
{
    public sealed record DeactivateCategoryCommand(int id) : IRequest;
}