package com.substring.chat.chat_app_backend.controllers;

import java.time.LocalDateTime;

import com.substring.chat.chat_app_backend.entities.Message;
import com.substring.chat.chat_app_backend.entities.Room;
import com.substring.chat.chat_app_backend.playload.MessageRequest;
import com.substring.chat.chat_app_backend.repositories.RoomRepository;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;

@Controller
@CrossOrigin("AppConstant.FRONT_END_BASE_URL")
public class ChatController {


    private RoomRepository roomRepository;
    
    public ChatController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    // send and receive messages
    @MessageMapping("/sendMessage/{roomId}") //chat.sendMessage/roomId
    @SendTo("/topic/room/{roomId}") //subscribe to this topic
    public Message sendMessage(
        @DestinationVariable String roomId,
        @RequestBody MessageRequest request
    ) {
        
    Room room = roomRepository.findByRoomId(request.getRoomId());


    Message message = new Message();
    message.setContent(request.getContent());
    message.setSender(request.getSender());
    message.setTimeStamp(LocalDateTime.now());

    if(room != null) {
        room.getMessages().add(message);
        roomRepository.save(room);

        }
        else{
            throw new RuntimeException("Room not found");
        }
    return message;
    }
}