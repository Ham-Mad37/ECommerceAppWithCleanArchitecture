using MediatR;

namespace ECommerce.Application.Features.Categories.Command.ActivateCategory
{
    public sealed record ActivateCategoryCommand(int id) : IRequest;
}