/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-key */
import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import './carouselContact.scss'
import 'swiper/css';
import 'swiper/css/pagination';
import { Autoplay } from 'swiper/modules';
import { Pagination } from 'swiper/modules';
import { Fish } from '../../share/fish';


export default function CarouselContact({numberOfSlide =1, autoplay=false}) {

  return (
    <div className='CarouselPage'>
    <Swiper 
          slidesPerView={numberOfSlide}
          autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }} 
            pagination={true} 
            modules={autoplay ? [Autoplay, Pagination] : []}
            className={`carousel ${numberOfSlide > 1 ? 'multi-items' : ''}`}
          >
            {
              Fish.map((fish)=>(
                <SwiperSlide>
                  <img 
                  src={fish.Image} 
                  alt="" />
                </SwiperSlide>
              ))
            }
          </Swiper>
    </div>
      
    
  );
}
