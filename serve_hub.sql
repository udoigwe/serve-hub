-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 28, 2024 at 01:18 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `serve_hub`
--

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `message_id` int(11) NOT NULL,
  `message_subject` varchar(255) NOT NULL,
  `message_sender` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `sent_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `review_id` int(11) NOT NULL,
  `service_id` int(11) DEFAULT NULL,
  `reviewer_id` int(11) DEFAULT NULL,
  `review` longtext NOT NULL,
  `rating` float NOT NULL,
  `reviewed_at` datetime NOT NULL DEFAULT current_timestamp(),
  `review_status` enum('Published','Unpublished') NOT NULL DEFAULT 'Published'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `service_id` int(11) NOT NULL,
  `subscription_id` int(11) NOT NULL,
  `service_category_id` int(11) NOT NULL,
  `service_title` varchar(255) NOT NULL,
  `service_slug` varchar(255) NOT NULL,
  `service_price` int(11) NOT NULL DEFAULT 1,
  `service_discount_rate` int(11) DEFAULT NULL,
  `service_description` longtext NOT NULL,
  `service_address` text NOT NULL,
  `service_location_y` varchar(255) DEFAULT NULL,
  `service_location_x` varchar(255) DEFAULT NULL,
  `service_youtube_video_url` varchar(255) DEFAULT NULL,
  `service_created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `service_status` enum('Published','Unpublished') NOT NULL DEFAULT 'Published'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_bookings`
--

CREATE TABLE `service_bookings` (
  `service_booking_id` int(11) NOT NULL,
  `service_id` int(11) DEFAULT NULL,
  `start_time` datetime NOT NULL COMMENT 'Start time of service rendering',
  `end_time` datetime NOT NULL COMMENT 'End time of service rendering',
  `client_fullname` varchar(255) NOT NULL,
  `client_email` varchar(255) NOT NULL,
  `client_phone` varchar(255) NOT NULL,
  `client_address` varchar(255) NOT NULL,
  `remarks` text DEFAULT NULL,
  `amount_paid` double NOT NULL,
  `discount` double NOT NULL,
  `expected_payout` double NOT NULL,
  `booked_at` datetime NOT NULL DEFAULT current_timestamp(),
  `booking_status` enum('Booked','Provider Accepted','Provider Rejected','Canceled','Completed') NOT NULL DEFAULT 'Booked',
  `payout_status` enum('Pending Payout','Scheduled For Payout','Paid Out','') NOT NULL DEFAULT 'Pending Payout'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_categories`
--

CREATE TABLE `service_categories` (
  `service_category_id` int(11) NOT NULL,
  `service_category` varchar(255) NOT NULL,
  `service_category_slug` varchar(255) NOT NULL,
  `service_category_status` enum('Active','Inactive') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_enquiries`
--

CREATE TABLE `service_enquiries` (
  `service_enquiry_id` int(11) NOT NULL,
  `service_id` int(11) DEFAULT NULL,
  `sender` varchar(255) NOT NULL,
  `sender_email` varchar(255) NOT NULL,
  `sender_phone_number` varchar(255) NOT NULL,
  `message_subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `enquiry_created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_faq`
--

CREATE TABLE `service_faq` (
  `service_faq_id` int(11) NOT NULL,
  `service_id` int(11) DEFAULT NULL,
  `service_faq_question` text NOT NULL,
  `service_faq_answer` longtext NOT NULL,
  `service_faq_created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_images`
--

CREATE TABLE `service_images` (
  `service_image_id` int(11) NOT NULL,
  `service_id` int(11) DEFAULT NULL,
  `service_image_filename` varchar(255) NOT NULL,
  `service_image_mimetype` varchar(255) NOT NULL,
  `service_image_size` varchar(255) NOT NULL,
  `service_image_created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `service_image_status` enum('Published','Unpublished') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `subscription_id` int(11) NOT NULL,
  `subscription_plan_id` int(11) DEFAULT NULL,
  `subscriber_id` int(11) DEFAULT NULL,
  `subscription_amount` int(5) NOT NULL,
  `subscribed_at` datetime NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscription_plans`
--

CREATE TABLE `subscription_plans` (
  `subscription_plan_id` int(11) NOT NULL,
  `subscription_plan_title` varchar(255) NOT NULL,
  `subscription_plan_slug` varchar(255) NOT NULL,
  `duration` int(5) NOT NULL DEFAULT 1,
  `no_of_services` int(5) NOT NULL DEFAULT 1,
  `no_of_images_per_service` int(5) NOT NULL DEFAULT 1,
  `is_featured` enum('Yes','No') NOT NULL DEFAULT 'No',
  `price` float NOT NULL DEFAULT 0,
  `service_charge` float NOT NULL DEFAULT 100 COMMENT 'Service charge in percentage %',
  `subscription_plan_status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `subscription_plan_created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscription_plans`
--

INSERT INTO `subscription_plans` (`subscription_plan_id`, `subscription_plan_title`, `subscription_plan_slug`, `duration`, `no_of_services`, `no_of_images_per_service`, `is_featured`, `price`, `service_charge`, `subscription_plan_status`, `subscription_plan_created_at`) VALUES
(1, 'Gold Plan', 'gold_plan', 300, 5, 12, 'Yes', 13, 13, 'Active', '2024-10-27 21:03:22'),
(2, 'Starter Package', 'starter_package', 120, 3, 2, 'No', 5, 0, 'Active', '2024-10-27 21:04:06'),
(3, 'Platinum Plan', 'platinum_plan', 180, 6, 6, 'Yes', 11, 11, 'Active', '2024-10-27 21:17:47');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `user_full_name` varchar(255) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_phone` varchar(255) NOT NULL,
  `user_password` varchar(255) NOT NULL,
  `user_enc_password` varchar(255) NOT NULL,
  `user_category` enum('Admin','Service Provider','Customer') NOT NULL DEFAULT 'Customer',
  `certificate_of_incoporation_filename` varchar(255) DEFAULT NULL,
  `user_avatar_filename` varchar(255) DEFAULT NULL,
  `user_fb_url` varchar(255) DEFAULT NULL,
  `user_instagram_url` varchar(255) DEFAULT NULL,
  `user_x_url` varchar(255) DEFAULT NULL,
  `user_whatsapp_url` varchar(255) DEFAULT NULL,
  `user_youtube_url` varchar(255) DEFAULT NULL,
  `user_linkedin_url` varchar(255) DEFAULT NULL,
  `user_created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `user_status` enum('Active','Inactive') NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `user_full_name`, `user_email`, `user_phone`, `user_password`, `user_enc_password`, `user_category`, `certificate_of_incoporation_filename`, `user_avatar_filename`, `user_fb_url`, `user_instagram_url`, `user_x_url`, `user_whatsapp_url`, `user_youtube_url`, `user_linkedin_url`, `user_created_at`, `user_status`) VALUES
(1, 'Jon', 'jonsnow@hotmail.com', '09089182918', 'strongpass', 'U2FsdGVkX1/ufjbrfTC66n9osMhJ8V/+Wc/baapN1mY=', 'Admin', NULL, '960b38ad-0997-4336-8b80-39bec0db1bf6.png', NULL, NULL, NULL, NULL, NULL, NULL, '2024-10-05 10:09:17', 'Active'),
(2, 'John Stones', 'stones@gmail.com', '+1(823)890980', 'servehub2024', 'U2FsdGVkX1+zN2Unheln9pK/sbSreYbdeaNFbmqCJL4=', 'Admin', NULL, 'a00eec0a-0e91-4019-8bad-4e0a43e79830.png', NULL, NULL, NULL, NULL, NULL, NULL, '2024-10-06 07:16:47', 'Active'),
(3, 'Sam Elrond', 'elrond@gmail.com', '09089098909', 'servehub2024', 'U2FsdGVkX1+4RmnpsLTEzYRQKfRpP1isnwgkYIQbZW8=', 'Service Provider', '3e346385-f70f-4c27-aeee-41cd09f63900.png', 'a17e8630-5c77-4f70-9f1a-1f54fd23e897.jpg', 'facebook.com/elrond', 'instagram.com/elrond', 'x.com/elrond', 'whatsapp.com/elrond', 'youtube.com/elrond', 'linkedin.com/elrond', '2024-10-06 07:18:58', 'Active'),
(4, 'Samuel Onuoha', 'sammy@gmail.com', '09089098787', 'servehub2024', 'U2FsdGVkX1+F4L6+RFZ1WhWsIQm3eFNuG48t+U1GNaM=', 'Service Provider', '562f2939-216a-49a2-8ec0-598a9b892de0.jpg', 'b9c91bd4-65b7-4a3c-97cd-6cfc9fa4ee4d.png', NULL, NULL, NULL, NULL, NULL, NULL, '2024-10-07 20:50:45', 'Active'),
(5, 'Clemanze', 'onyenze@gmail.com', '08012890911', 'servehub2024', 'U2FsdGVkX18aFH1TkH42g1LnPxcCXdJehd5vk1LkLRo=', 'Customer', '381bfb58-b588-4621-addf-663489611816.jpeg', 'c24cb1f2-26b6-4a52-be34-cd9b41580f15.png', NULL, NULL, NULL, NULL, NULL, NULL, '2024-10-12 03:10:16', 'Active'),
(6, 'Joe Okoye', 'okoye@gmail.com', '0900980989', 'servehub2024', 'U2FsdGVkX18I+mu0c5awI5rldc1Aw6oiynufbGaf0l8=', 'Customer', NULL, '62eedbff-5715-4ea7-8cd4-d025b916e965.png', NULL, NULL, NULL, NULL, NULL, NULL, '2024-10-21 12:35:55', 'Active'),
(8, 'Rise Washers', 'rise@gmail.com', '08076545676', 'servehub2024', 'U2FsdGVkX191Dzk1sg5722saWtacGbqI5ziYSkaEPsg=', 'Service Provider', 'e04fab19-564b-4878-9919-55b0145e24cd.jpg', '755dd857-5d9f-4b39-9a44-6c80034f91af.png', NULL, NULL, NULL, NULL, NULL, NULL, '2024-10-26 19:27:08', 'Active');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`message_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `reviewer_id` (`reviewer_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`service_id`),
  ADD KEY `subscription_id` (`subscription_id`),
  ADD KEY `service_category_id` (`service_category_id`);

--
-- Indexes for table `service_bookings`
--
ALTER TABLE `service_bookings`
  ADD PRIMARY KEY (`service_booking_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `service_categories`
--
ALTER TABLE `service_categories`
  ADD PRIMARY KEY (`service_category_id`);

--
-- Indexes for table `service_enquiries`
--
ALTER TABLE `service_enquiries`
  ADD PRIMARY KEY (`service_enquiry_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `service_faq`
--
ALTER TABLE `service_faq`
  ADD PRIMARY KEY (`service_faq_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `service_images`
--
ALTER TABLE `service_images`
  ADD PRIMARY KEY (`service_image_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`subscription_id`),
  ADD KEY `subscription_plan_id` (`subscription_plan_id`),
  ADD KEY `subscriber_id` (`subscriber_id`);

--
-- Indexes for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD PRIMARY KEY (`subscription_plan_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `service_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service_bookings`
--
ALTER TABLE `service_bookings`
  MODIFY `service_booking_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service_categories`
--
ALTER TABLE `service_categories`
  MODIFY `service_category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `service_enquiries`
--
ALTER TABLE `service_enquiries`
  MODIFY `service_enquiry_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service_faq`
--
ALTER TABLE `service_faq`
  MODIFY `service_faq_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service_images`
--
ALTER TABLE `service_images`
  MODIFY `service_image_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `subscription_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  MODIFY `subscription_plan_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `service_enquiries`
--
ALTER TABLE `service_enquiries`
  ADD CONSTRAINT `service_enquiries_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `service_faq`
--
ALTER TABLE `service_faq`
  ADD CONSTRAINT `service_faq_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `service_images`
--
ALTER TABLE `service_images`
  ADD CONSTRAINT `service_images_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`subscriber_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `subscriptions_ibfk_2` FOREIGN KEY (`subscription_plan_id`) REFERENCES `subscription_plans` (`subscription_plan_id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
