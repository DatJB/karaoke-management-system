package com.karaoke.backend.entity;

import lombok.Data;

@Data
public class FeedbackTag
{
    private String aspect;
    private String sentiment;

    public static FeedbackTag valueOf(String text)
    {
        FeedbackTag tag = new FeedbackTag();
        tag.aspect = text;
        return tag;
    }
}