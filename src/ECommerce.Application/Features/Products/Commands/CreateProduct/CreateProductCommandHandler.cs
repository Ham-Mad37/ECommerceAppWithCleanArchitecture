using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Products.Commands.CreateProduct;
using ECommerce.Domain.Entities.Products;
using MediatR;

namespace ECommerce.Application.Features.Products.CreateProduct;

public sealed class CreateProductCommandHandler
    : IRequestHandler<CreateProductCommand, int>
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateProductCommandHandler(
        IProductRepository productRepository,
        ICategoryRepository categoryRepository,
        IUnitOfWork unitOfWork)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<int> Handle(
        CreateProductCommand request,
        CancellationToken cancellationToken)
    {
        // =====================================================
        // 1. Validate category
        // =====================================================

        var category =
            await _categoryRepository.GetByIdAsync(
                request.CategoryId,
                cancellationToken);

        if (category is null)
        {
            throw new NotFoundException(
                $"Category with ID {request.CategoryId} was not found.");
        }

        if (!category.IsActive)
        {
            throw new ConflictException(
                $"Category '{category.Name}' is inactive.");
        }

        // =====================================================
        // 2. Create product
        // =====================================================

        var product = Product.Create(
            request.Name,
            request.Description,
            request.Price,
            request.StockQuantity,
            request.CategoryId);

        // =====================================================
        // 3. Save
        // =====================================================

        await _productRepository.AddAsync(
            product,
            cancellationToken);

        await _unitOfWork.SaveChangesAsync(
            cancellationToken);

        return product.Id;
    }
}