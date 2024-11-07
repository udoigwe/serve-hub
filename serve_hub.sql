-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 07, 2024 at 09:36 PM
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

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`service_id`, `subscription_id`, `service_category_id`, `service_title`, `service_slug`, `service_price`, `service_discount_rate`, `service_description`, `service_address`, `service_location_y`, `service_location_x`, `service_youtube_video_url`, `service_created_at`, `service_status`) VALUES
(4, 23, 4, 'Elliot Barbing Services', 'elliot_barbing_services', 13, NULL, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis posuere dolor. Maecenas imperdiet feugiat massa, eu fermentum neque pretium at. Fusce ultricies rutrum tellus vitae rutrum. Quisque mauris dui, tempor nec urna sed, cursus tincidunt massa. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis eget lacus elit. Vestibulum viverra enim nec magna vehicula rhoncus vitae nec lectus. Pellentesque hendrerit non lectus eu sagittis. Donec dignissim ipsum eu dolor facilisis, ac dapibus diam fermentum. In quis fermentum felis. In dictum ipsum ac facilisis venenatis. Sed aliquet sodales ante ullamcorper cursus. Proin ut dignissim augue.\r\n\r\nCurabitur lacinia at lectus id vulputate. Ut at orci augue. Praesent ac nulla id eros molestie convallis vulputate sed nulla. Ut venenatis, sem posuere commodo pretium, erat purus laoreet urna, ac pretium ipsum lorem ac nisl. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec erat quam, dignissim eu nisi vel, luctus accumsan arcu. Curabitur gravida ut quam eu vehicula. Suspendisse vehicula cursus lectus vitae accumsan. Quisque ut nibh imperdiet, accumsan risus eget, egestas mi.\r\n\r\nMaecenas rutrum eros magna, a mollis neque hendrerit vel. Nunc id ultrices metus, non tincidunt eros. Suspendisse iaculis tortor nibh, sed hendrerit turpis hendrerit quis. Curabitur id tortor nec justo fringilla tristique. Maecenas non arcu lorem. Integer vitae mauris lacus. Ut luctus neque id sapien porta, id porttitor nisl fringilla. Nam aliquam risus sem, nec dapibus augue imperdiet vel. Proin tempus orci nunc, sed bibendum justo blandit tincidunt. Proin sed nisi lectus. Donec tincidunt efficitur ex. In tristique purus ut eros vehicula, quis convallis leo tempus.\r\n\r\nDonec vitae nisi nibh. In non maximus mi, sed sollicitudin ex. Quisque eu ullamcorper tellus, non interdum ipsum. Aliquam condimentum elit aliquam ipsum tincidunt tristique. In hac habitasse platea dictumst. Praesent consequat ex tempus, porta libero a, ornare tortor. Donec id arcu eget orci maximus placerat vel quis mauris.\r\n\r\nNulla pretium elementum ligula, eu maximus magna ullamcorper et. Integer viverra tellus dui, sollicitudin vulputate velit vehicula mollis. Quisque urna nibh, tincidunt non tempor quis, rutrum ut mi. Quisque quis magna et libero bibendum interdum nec eu orci. Nunc vitae nisl tempus, tristique erat et, vestibulum quam. Duis efficitur, diam in dignissim aliquet, dolor elit sagittis turpis, sit amet vestibulum nunc justo at tellus. Integer felis justo, porta a diam in, commodo ornare elit. Curabitur vel iaculis nisl. Pellentesque molestie vehicula dolor, et blandit massa auctor et.', 'Vermont', NULL, NULL, NULL, '2024-11-07 15:12:31', 'Published'),
(5, 23, 5, 'Zoba Artists', 'zoba_artists', 23, NULL, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis posuere dolor. Maecenas imperdiet feugiat massa, eu fermentum neque pretium at. Fusce ultricies rutrum tellus vitae rutrum. Quisque mauris dui, tempor nec urna sed, cursus tincidunt massa. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis eget lacus elit. Vestibulum viverra enim nec magna vehicula rhoncus vitae nec lectus. Pellentesque hendrerit non lectus eu sagittis. Donec dignissim ipsum eu dolor facilisis, ac dapibus diam fermentum. In quis fermentum felis. In dictum ipsum ac facilisis venenatis. Sed aliquet sodales ante ullamcorper cursus. Proin ut dignissim augue.\r\n\r\nCurabitur lacinia at lectus id vulputate. Ut at orci augue. Praesent ac nulla id eros molestie convallis vulputate sed nulla. Ut venenatis, sem posuere commodo pretium, erat purus laoreet urna, ac pretium ipsum lorem ac nisl. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec erat quam, dignissim eu nisi vel, luctus accumsan arcu. Curabitur gravida ut quam eu vehicula. Suspendisse vehicula cursus lectus vitae accumsan. Quisque ut nibh imperdiet, accumsan risus eget, egestas mi.\r\n\r\nMaecenas rutrum eros magna, a mollis neque hendrerit vel. Nunc id ultrices metus, non tincidunt eros. Suspendisse iaculis tortor nibh, sed hendrerit turpis hendrerit quis. Curabitur id tortor nec justo fringilla tristique. Maecenas non arcu lorem. Integer vitae mauris lacus. Ut luctus neque id sapien porta, id porttitor nisl fringilla. Nam aliquam risus sem, nec dapibus augue imperdiet vel. Proin tempus orci nunc, sed bibendum justo blandit tincidunt. Proin sed nisi lectus. Donec tincidunt efficitur ex. In tristique purus ut eros vehicula, quis convallis leo tempus.\r\n\r\nDonec vitae nisi nibh. In non maximus mi, sed sollicitudin ex. Quisque eu ullamcorper tellus, non interdum ipsum. Aliquam condimentum elit aliquam ipsum tincidunt tristique. In hac habitasse platea dictumst. Praesent consequat ex tempus, porta libero a, ornare tortor. Donec id arcu eget orci maximus placerat vel quis mauris.\r\n\r\nNulla pretium elementum ligula, eu maximus magna ullamcorper et. Integer viverra tellus dui, sollicitudin vulputate velit vehicula mollis. Quisque urna nibh, tincidunt non tempor quis, rutrum ut mi. Quisque quis magna et libero bibendum interdum nec eu orci. Nunc vitae nisl tempus, tristique erat et, vestibulum quam. Duis efficitur, diam in dignissim aliquet, dolor elit sagittis turpis, sit amet vestibulum nunc justo at tellus. Integer felis justo, porta a diam in, commodo ornare elit. Curabitur vel iaculis nisl. Pellentesque molestie vehicula dolor, et blandit massa auctor et.', 'Minnesotta', NULL, NULL, NULL, '2024-11-07 15:16:42', 'Published'),
(6, 23, 3, 'Wale Cleaners', 'wale_cleaners', 24, NULL, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis posuere dolor. Maecenas imperdiet feugiat massa, eu fermentum neque pretium at. Fusce ultricies rutrum tellus vitae rutrum. Quisque mauris dui, tempor nec urna sed, cursus tincidunt massa. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis eget lacus elit. Vestibulum viverra enim nec magna vehicula rhoncus vitae nec lectus. Pellentesque hendrerit non lectus eu sagittis. Donec dignissim ipsum eu dolor facilisis, ac dapibus diam fermentum. In quis fermentum felis. In dictum ipsum ac facilisis venenatis. Sed aliquet sodales ante ullamcorper cursus. Proin ut dignissim augue.\r\n\r\nCurabitur lacinia at lectus id vulputate. Ut at orci augue. Praesent ac nulla id eros molestie convallis vulputate sed nulla. Ut venenatis, sem posuere commodo pretium, erat purus laoreet urna, ac pretium ipsum lorem ac nisl. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec erat quam, dignissim eu nisi vel, luctus accumsan arcu. Curabitur gravida ut quam eu vehicula. Suspendisse vehicula cursus lectus vitae accumsan. Quisque ut nibh imperdiet, accumsan risus eget, egestas mi.\r\n\r\nMaecenas rutrum eros magna, a mollis neque hendrerit vel. Nunc id ultrices metus, non tincidunt eros. Suspendisse iaculis tortor nibh, sed hendrerit turpis hendrerit quis. Curabitur id tortor nec justo fringilla tristique. Maecenas non arcu lorem. Integer vitae mauris lacus. Ut luctus neque id sapien porta, id porttitor nisl fringilla. Nam aliquam risus sem, nec dapibus augue imperdiet vel. Proin tempus orci nunc, sed bibendum justo blandit tincidunt. Proin sed nisi lectus. Donec tincidunt efficitur ex. In tristique purus ut eros vehicula, quis convallis leo tempus.\r\n\r\nDonec vitae nisi nibh. In non maximus mi, sed sollicitudin ex. Quisque eu ullamcorper tellus, non interdum ipsum. Aliquam condimentum elit aliquam ipsum tincidunt tristique. In hac habitasse platea dictumst. Praesent consequat ex tempus, porta libero a, ornare tortor. Donec id arcu eget orci maximus placerat vel quis mauris.\r\n\r\nNulla pretium elementum ligula, eu maximus magna ullamcorper et. Integer viverra tellus dui, sollicitudin vulputate velit vehicula mollis. Quisque urna nibh, tincidunt non tempor quis, rutrum ut mi. Quisque quis magna et libero bibendum interdum nec eu orci. Nunc vitae nisl tempus, tristique erat et, vestibulum quam. Duis efficitur, diam in dignissim aliquet, dolor elit sagittis turpis, sit amet vestibulum nunc justo at tellus. Integer felis justo, porta a diam in, commodo ornare elit. Curabitur vel iaculis nisl. Pellentesque molestie vehicula dolor, et blandit massa auctor et.', 'Minnesota', NULL, NULL, NULL, '2024-11-07 15:21:49', 'Published'),
(7, 23, 4, 'ManeR  Barbing', 'maner_barbing', 24, NULL, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis posuere dolor. Maecenas imperdiet feugiat massa, eu fermentum neque pretium at. Fusce ultricies rutrum tellus vitae rutrum. Quisque mauris dui, tempor nec urna sed, cursus tincidunt massa. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis eget lacus elit. Vestibulum viverra enim nec magna vehicula rhoncus vitae nec lectus. Pellentesque hendrerit non lectus eu sagittis. Donec dignissim ipsum eu dolor facilisis, ac dapibus diam fermentum. In quis fermentum felis. In dictum ipsum ac facilisis venenatis. Sed aliquet sodales ante ullamcorper cursus. Proin ut dignissim augue.\r\n\r\nCurabitur lacinia at lectus id vulputate. Ut at orci augue. Praesent ac nulla id eros molestie convallis vulputate sed nulla. Ut venenatis, sem posuere commodo pretium, erat purus laoreet urna, ac pretium ipsum lorem ac nisl. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec erat quam, dignissim eu nisi vel, luctus accumsan arcu. Curabitur gravida ut quam eu vehicula. Suspendisse vehicula cursus lectus vitae accumsan. Quisque ut nibh imperdiet, accumsan risus eget, egestas mi.\r\n\r\nMaecenas rutrum eros magna, a mollis neque hendrerit vel. Nunc id ultrices metus, non tincidunt eros. Suspendisse iaculis tortor nibh, sed hendrerit turpis hendrerit quis. Curabitur id tortor nec justo fringilla tristique. Maecenas non arcu lorem. Integer vitae mauris lacus. Ut luctus neque id sapien porta, id porttitor nisl fringilla. Nam aliquam risus sem, nec dapibus augue imperdiet vel. Proin tempus orci nunc, sed bibendum justo blandit tincidunt. Proin sed nisi lectus. Donec tincidunt efficitur ex. In tristique purus ut eros vehicula, quis convallis leo tempus.\r\n\r\nDonec vitae nisi nibh. In non maximus mi, sed sollicitudin ex. Quisque eu ullamcorper tellus, non interdum ipsum. Aliquam condimentum elit aliquam ipsum tincidunt tristique. In hac habitasse platea dictumst. Praesent consequat ex tempus, porta libero a, ornare tortor. Donec id arcu eget orci maximus placerat vel quis mauris.\r\n\r\nNulla pretium elementum ligula, eu maximus magna ullamcorper et. Integer viverra tellus dui, sollicitudin vulputate velit vehicula mollis. Quisque urna nibh, tincidunt non tempor quis, rutrum ut mi. Quisque quis magna et libero bibendum interdum nec eu orci. Nunc vitae nisl tempus, tristique erat et, vestibulum quam. Duis efficitur, diam in dignissim aliquet, dolor elit sagittis turpis, sit amet vestibulum nunc justo at tellus. Integer felis justo, porta a diam in, commodo ornare elit. Curabitur vel iaculis nisl. Pellentesque molestie vehicula dolor, et blandit massa auctor et.', 'Minnesota', NULL, NULL, NULL, '2024-11-07 16:26:01', 'Published');

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

--
-- Dumping data for table `service_categories`
--

INSERT INTO `service_categories` (`service_category_id`, `service_category`, `service_category_slug`, `service_category_status`) VALUES
(3, 'Industrial Cleaning', 'industrial_cleaning', 'Active'),
(4, 'Professional Barbing', 'professional_barbing', 'Active'),
(5, 'Makeup Artistry', 'makeup_artistry', 'Active');

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

--
-- Dumping data for table `service_images`
--

INSERT INTO `service_images` (`service_image_id`, `service_id`, `service_image_filename`, `service_image_mimetype`, `service_image_size`, `service_image_created_at`, `service_image_status`) VALUES
(1, 4, 'f018ef8b-ff9c-4656-8bd7-a907e943434a.jpg', 'image/jpeg', '64990', '2024-11-07 15:12:31', 'Published'),
(2, 4, '6c844568-24b5-4ace-bc1a-dc5393fc2f42.jpg', 'image/jpeg', '62772', '2024-11-07 15:12:31', 'Published'),
(3, 4, '8b07d396-935c-4085-a578-e55fe0b235a8.jpg', 'image/jpeg', '72751', '2024-11-07 15:12:31', 'Published'),
(4, 4, 'b8f6e93f-23e1-468e-8f55-b81dad24ad5c.jpg', 'image/jpeg', '54766', '2024-11-07 15:12:31', 'Published'),
(5, 5, '4a9a3425-6890-49b3-b35a-3fbaf9d240cc.jpg', 'image/jpeg', '64990', '2024-11-07 15:16:42', 'Published'),
(6, 5, 'e4c1bd6a-2d7e-4083-86ba-fa79bd7f93a2.jpg', 'image/jpeg', '62772', '2024-11-07 15:16:42', 'Published'),
(7, 5, '764d801a-3f38-4625-9d67-e11cf3e0e882.jpg', 'image/jpeg', '72751', '2024-11-07 15:16:42', 'Published'),
(8, 5, '324ba76b-3540-4f04-8fc4-d279bb02a691.jpg', 'image/jpeg', '108885', '2024-11-07 15:16:42', 'Published'),
(9, 5, '5030b229-1cff-488e-a85c-01af47708390.jpg', 'image/jpeg', '232017', '2024-11-07 15:16:42', 'Published'),
(10, 5, 'd680b0cc-6418-418b-8a57-ad98337962d8.jpg', 'image/jpeg', '273626', '2024-11-07 15:16:42', 'Published'),
(11, 5, '94ae8852-8623-4829-ba40-eaf50e404579.jpg', 'image/jpeg', '224568', '2024-11-07 15:16:42', 'Published'),
(12, 5, '7646c94c-df5e-4e90-9045-bcb2afc699cd.jpg', 'image/jpeg', '261797', '2024-11-07 15:16:42', 'Published'),
(13, 5, '2c6a19db-d23c-45f3-840a-6356111c5cfb.jpg', 'image/jpeg', '65116', '2024-11-07 15:16:42', 'Published'),
(14, 5, 'faf4c83b-2a5a-4d24-ab2f-c22a42306f6b.jpg', 'image/jpeg', '41456', '2024-11-07 15:16:42', 'Published'),
(33, 7, 'd0ccd496-5e2b-419a-a262-45d60a466728.jpg', 'image/jpeg', '342445', '2024-11-07 17:44:55', 'Published'),
(34, 7, 'ac4c4633-3c97-4240-a53d-8e9e23726f62.jpg', 'image/jpeg', '273626', '2024-11-07 17:44:55', 'Published'),
(35, 7, '2cb1d3fb-7d70-4baa-9641-8273fad468b6.jpg', 'image/jpeg', '224568', '2024-11-07 17:44:55', 'Published'),
(36, 7, '0a24f964-f2c6-4b1e-ae5a-d71b1fb0b947.jpg', 'image/jpeg', '261797', '2024-11-07 17:44:55', 'Published'),
(37, 6, '77711766-5512-4a41-bb1f-14e6286b9a1f.jpg', 'image/jpeg', '62772', '2024-11-07 17:45:17', 'Published'),
(38, 6, '85618921-4814-4241-9905-b3c5a9c49742.jpg', 'image/jpeg', '72751', '2024-11-07 17:45:17', 'Published'),
(39, 6, '568a946d-7ca1-4ad5-836c-f0e01c3f9003.jpg', 'image/jpeg', '53224', '2024-11-07 17:45:17', 'Published');

-- --------------------------------------------------------

--
-- Stand-in structure for view `service_view`
-- (See below for the actual view)
--
CREATE TABLE `service_view` (
`service_id` int(11)
,`subscription_id` int(11)
,`service_category_id` int(11)
,`service_title` varchar(255)
,`service_slug` varchar(255)
,`service_price` int(11)
,`service_discount_rate` int(11)
,`service_description` longtext
,`service_address` text
,`service_location_y` varchar(255)
,`service_location_x` varchar(255)
,`service_youtube_video_url` varchar(255)
,`service_created_at` datetime
,`service_status` enum('Published','Unpublished')
,`subscription_plan_id` int(11)
,`subscriber_id` int(11)
,`subscription_amount` int(5)
,`subscribed_at` datetime
,`expires_at` timestamp
,`duration` int(5)
,`is_featured` enum('Yes','No')
,`no_of_images_per_service` int(5)
,`no_of_services` int(5)
,`subscription_price` float
,`service_charge` float
,`subscription_plan_status` enum('Active','Inactive')
,`subscription_plan_title` varchar(255)
,`provider` varchar(255)
,`service_category` varchar(255)
);

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
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `transaction_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`subscription_id`, `subscription_plan_id`, `subscriber_id`, `subscription_amount`, `subscribed_at`, `expires_at`, `transaction_id`) VALUES
(21, 3, 6, 11, '2024-11-07 00:06:32', '2024-11-06 23:09:32', 'T705812714044614'),
(22, 3, 6, 11, '2024-11-07 00:07:23', '2024-11-06 23:12:31', 'T292446195337665'),
(23, 3, 6, 11, '2024-11-07 00:08:50', '2024-11-06 23:15:30', 'T110506023180976'),
(24, 1, 6, 13, '2024-11-07 17:36:33', '2024-11-07 16:41:33', 'T506873135814929'),
(25, 1, 6, 13, '2024-11-07 17:44:33', '2024-11-07 16:49:33', 'T137538683950478');

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
-- Stand-in structure for view `subscription_view`
-- (See below for the actual view)
--
CREATE TABLE `subscription_view` (
`subscription_id` int(11)
,`subscription_plan_id` int(11)
,`subscriber_id` int(11)
,`subscription_amount` int(5)
,`subscribed_at` datetime
,`expires_at` timestamp
,`transaction_id` varchar(255)
,`duration` int(5)
,`is_featured` enum('Yes','No')
,`no_of_images_per_service` int(5)
,`no_of_services` int(5)
,`price` float
,`service_charge` float
,`subscription_plan_status` enum('Active','Inactive')
,`subscription_plan_title` varchar(255)
,`user_full_name` varchar(255)
);

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
(6, 'Joe Okoye', 'okoye@gmail.com', '0900980989', 'servehub2024', 'U2FsdGVkX18I+mu0c5awI5rldc1Aw6oiynufbGaf0l8=', 'Service Provider', NULL, '62eedbff-5715-4ea7-8cd4-d025b916e965.png', NULL, NULL, NULL, NULL, NULL, NULL, '2024-10-21 12:35:55', 'Active'),
(8, 'Rise Washers', 'rise@gmail.com', '08076545676', 'servehub2024', 'U2FsdGVkX191Dzk1sg5722saWtacGbqI5ziYSkaEPsg=', 'Service Provider', 'e04fab19-564b-4878-9919-55b0145e24cd.jpg', '755dd857-5d9f-4b39-9a44-6c80034f91af.png', NULL, NULL, NULL, NULL, NULL, NULL, '2024-10-26 19:27:08', 'Active');

-- --------------------------------------------------------

--
-- Structure for view `service_view`
--
DROP TABLE IF EXISTS `service_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `service_view`  AS SELECT `a`.`service_id` AS `service_id`, `a`.`subscription_id` AS `subscription_id`, `a`.`service_category_id` AS `service_category_id`, `a`.`service_title` AS `service_title`, `a`.`service_slug` AS `service_slug`, `a`.`service_price` AS `service_price`, `a`.`service_discount_rate` AS `service_discount_rate`, `a`.`service_description` AS `service_description`, `a`.`service_address` AS `service_address`, `a`.`service_location_y` AS `service_location_y`, `a`.`service_location_x` AS `service_location_x`, `a`.`service_youtube_video_url` AS `service_youtube_video_url`, `a`.`service_created_at` AS `service_created_at`, `a`.`service_status` AS `service_status`, `b`.`subscription_plan_id` AS `subscription_plan_id`, `b`.`subscriber_id` AS `subscriber_id`, `b`.`subscription_amount` AS `subscription_amount`, `b`.`subscribed_at` AS `subscribed_at`, `b`.`expires_at` AS `expires_at`, `b`.`duration` AS `duration`, `b`.`is_featured` AS `is_featured`, `b`.`no_of_images_per_service` AS `no_of_images_per_service`, `b`.`no_of_services` AS `no_of_services`, `b`.`price` AS `subscription_price`, `b`.`service_charge` AS `service_charge`, `b`.`subscription_plan_status` AS `subscription_plan_status`, `b`.`subscription_plan_title` AS `subscription_plan_title`, `b`.`user_full_name` AS `provider`, `c`.`service_category` AS `service_category` FROM ((`services` `a` left join `subscription_view` `b` on(`a`.`subscription_id` = `b`.`subscription_id`)) left join `service_categories` `c` on(`a`.`service_category_id` = `c`.`service_category_id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `subscription_view`
--
DROP TABLE IF EXISTS `subscription_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `subscription_view`  AS SELECT `a`.`subscription_id` AS `subscription_id`, `a`.`subscription_plan_id` AS `subscription_plan_id`, `a`.`subscriber_id` AS `subscriber_id`, `a`.`subscription_amount` AS `subscription_amount`, `a`.`subscribed_at` AS `subscribed_at`, `a`.`expires_at` AS `expires_at`, `a`.`transaction_id` AS `transaction_id`, `b`.`duration` AS `duration`, `b`.`is_featured` AS `is_featured`, `b`.`no_of_images_per_service` AS `no_of_images_per_service`, `b`.`no_of_services` AS `no_of_services`, `b`.`price` AS `price`, `b`.`service_charge` AS `service_charge`, `b`.`subscription_plan_status` AS `subscription_plan_status`, `b`.`subscription_plan_title` AS `subscription_plan_title`, `c`.`user_full_name` AS `user_full_name` FROM ((`subscriptions` `a` left join `subscription_plans` `b` on(`a`.`subscription_plan_id` = `b`.`subscription_plan_id`)) left join `users` `c` on(`a`.`subscriber_id` = `c`.`user_id`)) ;

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
  MODIFY `service_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `service_bookings`
--
ALTER TABLE `service_bookings`
  MODIFY `service_booking_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service_categories`
--
ALTER TABLE `service_categories`
  MODIFY `service_category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
  MODIFY `service_image_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `subscription_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

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
