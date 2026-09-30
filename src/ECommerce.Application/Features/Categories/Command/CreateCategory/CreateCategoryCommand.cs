using MediatR;

namespace ECommerce.Application.Features.Categories.Command.CreateCategory
{
    public sealed record CreateCategoryCommand(string name) : IRequest<int>;
}