package com.karaoke.backend.security.service;

import com.karaoke.backend.security.dto.ShareDTO;
import org.springframework.web.multipart.MultipartFile;

import java.security.PrivateKey;
import java.util.List;

public interface KeyManagementService
{
//    List<ShareDTO> generateAndSplitMasterKey() throws Exception;

    PrivateKey restoreMasterKey(List<ShareDTO> shares) throws Exception;

    List<ShareDTO> splitUploadedPemKey(MultipartFile file) throws Exception;
}
