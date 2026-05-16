package com.karaoke.backend.service;

import com.karaoke.backend.dto.response.PricingCalculationResult;
import com.karaoke.backend.dto.response.TimeSliceDto;
import com.karaoke.backend.entity.RoomPrice;
import com.karaoke.backend.entity.RoomPriceSpecial;
import com.karaoke.backend.repository.RoomPriceRepository;
import com.karaoke.backend.repository.RoomPriceSpecialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class KaraokePricingEngine
{
    private final RoomPriceRepository normalRepo;
    private final RoomPriceSpecialRepository specialRepo;

    public PricingCalculationResult calculateRoomPriceWithSlices(Integer roomId, LocalDateTime checkinTime, LocalDateTime checkoutTime)
    {
        PricingCalculationResult result = new PricingCalculationResult();
        LocalDateTime currentCalcTime = checkinTime;

        while (currentCalcTime.isBefore(checkoutTime)) {
            LocalDate today = currentCalcTime.toLocalDate();
            LocalTime now = currentCalcTime.toLocalTime();
            RoomPrice.DayOfWeek currentDayEnum = RoomPrice.DayOfWeek.valueOf(currentCalcTime.getDayOfWeek().name().substring(0, 3));

            BigDecimal currentPricePerHour = BigDecimal.ZERO;
            LocalTime blockEndTime = LocalTime.MAX;

            // Slice value
            Optional<RoomPriceSpecial> specialOpt = specialRepo.findActiveSpecialPrice(roomId, today, now);
            if (specialOpt.isPresent()) {
                currentPricePerHour = specialOpt.get().getPricePerHour();
                blockEndTime = specialOpt.get().getEndTime();
            } else {
                Optional<RoomPrice> normalOpt = normalRepo.findActiveNormalPrice(roomId, currentDayEnum, now);
                if (normalOpt.isPresent()) {
                    currentPricePerHour = normalOpt.get().getPricePerHour();
                    blockEndTime = normalOpt.get().getEndTime();
                }
            }

            // Slice end
            LocalDateTime endOfBlockDateTime = LocalDateTime.of(today, blockEndTime);
            if (blockEndTime.equals(LocalTime.MAX) || blockEndTime.equals(LocalTime.of(23, 59, 59))) {
                endOfBlockDateTime = currentCalcTime.plusDays(1).with(LocalTime.MIDNIGHT);
            }
            LocalDateTime endOfSlice = checkoutTime.isBefore(endOfBlockDateTime) ? checkoutTime : endOfBlockDateTime;

            // Present slice
            long minutes = ChronoUnit.MINUTES.between(currentCalcTime, endOfSlice);
            BigDecimal hours = BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
            BigDecimal sliceCost = currentPricePerHour.multiply(hours);

            result.setTotalCost(result.getTotalCost().add(sliceCost));
            result.setTotalHours(result.getTotalHours().add(hours));

            TimeSliceDto sliceDto = new TimeSliceDto();
            sliceDto.setStartTime(currentCalcTime.toLocalTime());
            sliceDto.setEndTime(endOfSlice.toLocalTime());
            sliceDto.setPricePerHour(currentPricePerHour);
            sliceDto.setHours(hours);
            sliceDto.setAmount(sliceCost);
            result.getSlices().add(sliceDto);

            // Next slice
            currentCalcTime = endOfSlice;
            if (minutes == 0) break;
        }

        return result;
    }
}