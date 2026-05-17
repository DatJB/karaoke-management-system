package com.karaoke.backend.controller;

import com.karaoke.backend.service.ai.AgentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController
{
    private final AgentService agentService;

    @PostMapping("/ask")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public String ask(@RequestBody String question)
    {
        return agentService.ask(question);
    }
}