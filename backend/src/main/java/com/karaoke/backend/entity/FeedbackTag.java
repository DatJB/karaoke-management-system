package com.karaoke.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class FeedbackTag
{
//    private String aspect;
//    private String sentiment;
//
//    public static FeedbackTag valueOf(String text)
//    {
//        FeedbackTag tag = new FeedbackTag();
//        tag.aspect = text;
//        return tag;
//    }
    @Enumerated(EnumType.STRING)
    @Column(name = "tag_name")
    private SystemTag tagName;

    @Column(name = "extracted_tag")
    private String extractedTag;

    public enum SystemTag {
        SERVICE,
        FOOD,
        FACILITIES,
        EQUIPMENT,
        PRICE,
        GENERAL
    }
}