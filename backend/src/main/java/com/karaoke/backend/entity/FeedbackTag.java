package com.karaoke.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Embeddable
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