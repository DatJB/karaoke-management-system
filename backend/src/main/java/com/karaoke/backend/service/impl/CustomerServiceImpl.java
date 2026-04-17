package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.request.CustomerRequest;
import com.karaoke.backend.dto.response.CustomerResponse;
import com.karaoke.backend.dto.response.PageResponse;
import com.karaoke.backend.entity.Customer;
import com.karaoke.backend.exception.BusinessException;
import com.karaoke.backend.exception.DuplicateResourceException;
import com.karaoke.backend.exception.ResourceNotFoundException;
import com.karaoke.backend.repository.BookingRepository;
import com.karaoke.backend.repository.CustomerRepository;
import com.karaoke.backend.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService
{
    private final CustomerRepository customerRepository;
    private final BookingRepository bookingRepository;

    @Override
    public PageResponse<CustomerResponse> getAllCustomers(String keyword, int page, int size)
    {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("id").descending());

        Page<Customer> customerPage = customerRepository.searchCustomers(keyword, pageable);

        List<CustomerResponse> customerResponses = customerPage.getContent().stream()
                .map(customer -> CustomerResponse.builder()
                        .id(customer.getId())
                        .name(customer.getName())
                        .phone(customer.getPhone())
                        .identity(customer.getIdentity())
                        .email(customer.getEmail())
                        .address(customer.getAddress())
                        .createdAt(customer.getCreatedAt())
                        .build())
                .toList();

        return PageResponse.<CustomerResponse>builder()
                .currentPage(page)
                .totalPages(customerPage.getTotalPages())
                .pageSize(size)
                .totalElements(customerPage.getTotalElements())
                .data(customerResponses)
                .build();
    }

    @Override
    public CustomerResponse createCustomer(CustomerRequest request)
    {
        if (customerRepository.existsByPhone(request.getPhone()))
        {
            throw new DuplicateResourceException("Số điện thoại này đã được đăng ký cho khách hàng khác!");
        }

        if (request.getIdentity() != null && !request.getIdentity().trim().isEmpty())
        {
            if (customerRepository.existsByIdentity(request.getIdentity())) {
                throw new DuplicateResourceException("Số CMND/CCCD này đã được đăng ký cho khách hàng khác!");
            }
        }

        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer.setIdentity(request.getIdentity());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        customer.setCreatedAt(LocalDateTime.now());

        customer = customerRepository.save(customer);

        return CustomerResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .identity(customer.getIdentity())
                .email(customer.getEmail())
                .address(customer.getAddress())
                .createdAt(customer.getCreatedAt())
                .build();
    }

    @Override
    public CustomerResponse updateCustomer(Integer id, CustomerRequest request)
    {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + id));

        if (!customer.getPhone().equals(request.getPhone()) && customerRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Số điện thoại này đã được đăng ký cho khách hàng khác!");
        }

        if (request.getIdentity() != null && !request.getIdentity().trim().isEmpty())
        {
            if (!request.getIdentity().equals(customer.getIdentity()) && customerRepository.existsByIdentity(request.getIdentity())) {
                throw new DuplicateResourceException("Số CMND/CCCD này đã được đăng ký cho khách hàng khác!");
            }
        }

        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer.setIdentity(request.getIdentity());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());

        customer = customerRepository.save(customer);

        return CustomerResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .identity(customer.getIdentity())
                .email(customer.getEmail())
                .address(customer.getAddress())
                .createdAt(customer.getCreatedAt())
                .build();
    }

    @Override
    public void deleteCustomer(Integer id)
    {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với ID: " + id));

        if (bookingRepository.existsByCustomerId(id)) {
            throw new BusinessException("Không thể xóa: Khách hàng này đã có lịch sử đặt phòng (hoặc hóa đơn) trên hệ thống!");
        }

        customerRepository.delete(customer);
    }
}
