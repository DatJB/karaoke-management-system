package com.karaoke.backend.service;

import com.karaoke.backend.dto.request.CustomerRequest;
import com.karaoke.backend.dto.response.CustomerResponse;
import com.karaoke.backend.dto.response.PageResponse;

public interface CustomerService
{
    PageResponse<CustomerResponse> getAllCustomers(String keyword, int page, int size);

    CustomerResponse createCustomer(CustomerRequest request);

    CustomerResponse updateCustomer(Integer id, CustomerRequest request);

    void deleteCustomer(Integer id);
}
