using MediatR;

namespace ECommerce.Application.Features.Categories.Command.UpdateCategoryCommand
{
    public sealed record UpdateCategoryCommand(int Id, string Name) : IRequest;
}