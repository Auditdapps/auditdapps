import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import heroBg from "../assets/img/hero_bg_2_1.jpg";

const Hero: React.FC = () => {
  return (
    <section
      id="hero"
      className="relative h-[690px] w-full bg-no-repeat bg-cover bg-center"
    >
      {/* Background Image + Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Hero Background"
          className="w-full h-full object-cover max-h-[690px]"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center h-full">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <div className="text-white max-w-4xl">
            {/* Subtitle */}
            <span className="block mb-5 text-sm font-medium uppercase tracking-wider text-blue-300">
              ● Welcome to Audit Dapps
            </span>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              <span className="block">Your Personalized</span>
              <span className="block">Decentralized Security</span>
              <span className="block">Services.</span>
            </h1>

            {/* Slider (Paragraph & CTA) */}
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 10000, disableOnInteraction: false }}
              loop={true}
              pagination={{
                clickable: true,
                el: ".custom-swiper-pagination", // Custom pagination target
              }}
              className="w-full"
            >
              <SwiperSlide>
                <div>
                  <p className="text-white font-medium text-lg md:text-xl leading-relaxed mb-6">
                    At AuditDApps, we understand the pivotal role DApps play in the blockchain
                    ecosystem, and that’s why we’ve crafted a groundbreaking self-audit toolkit
                    to empower developers like you.
                  </p>
                  <a
                    href="/self-audit"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-8 py-3 rounded-full transition duration-300"
                  >
                    Try our self-audit tool
                  </a>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div>
                  <p className="text-white font-medium text-lg md:text-xl leading-relaxed mb-6">
                    Our team of cybersecurity experts, web3 security experts, and full-stack
                    blockchain developers can manually audit your decentralized application.
                  </p>
                  <a
                    href="/quote"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-8 py-3 rounded-full transition duration-300"
                  >
                    Get a quote
                  </a>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
