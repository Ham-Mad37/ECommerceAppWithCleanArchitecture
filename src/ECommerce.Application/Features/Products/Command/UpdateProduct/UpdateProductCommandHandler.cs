using ECommerce.Application.Common.Features.Products.Command.UpdateProduct;
using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Products.Commands.UpdateProduct
{
    public sealed class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand>    
    {
        private readonly IProductRepository _productRepository;
        private readonly IUnitOfWork _unitOfWork;
        public UpdateProductCommandHandler(IProductRepository productRepository, IUnitOfWork unitOfWork)
        {
            _productRepository = productRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task Handle(UpdateProductCommand request, CancellationToken cancellationToken)
        {
            var product = await _productRepository.GetByIdAsync(request.id, cancellationToken);
            if (product is null)
            {
                throw new KeyNotFoundException($"Product with this ID{request.id} was not found. ");
            }
            
            product.UpdateDetails(request.name, request.description, request.categoryId);
            product.ChangePrice(request.price);
            product.SetStockQuantity(request.stcokQuantity);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}