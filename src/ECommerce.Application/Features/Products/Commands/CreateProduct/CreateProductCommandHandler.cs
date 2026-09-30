using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Products.Commands.CreateProduct;
using ECommerce.Domain.Entities.Products;
using MediatR;
public sealed class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, int>
{
    private readonly IProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;
    public CreateProductCommandHandler(IProductRepository productRepository,IUnitOfWork unitOfWork)
    {
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }
    public async Task<int> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var product = Product.Create(request.name, request.description, request.price, request.StockQuantity, request.categoryId);
        
        await _productRepository.AddAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        return product.Id;

    }
}